import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { history, undo, redo, undoDepth } from '@tiptap/pm/history';

export const HISTORY_LIMIT = 20;
const recentKey = new PluginKey('recentEditorActions');
export const recentActions = (state) => recentKey.getState(state) || { undo: 0, redo: 0 };

function runHistory(direction, command, state, dispatch) {
  if (!recentActions(state)[direction]) return false;
  return command(state, dispatch && ((transaction) => dispatch(transaction.setMeta(recentKey, { direction }))));
}
export const undoRecent = (state, dispatch) => runHistory('undo', undo, state, dispatch);
export const redoRecent = (state, dispatch) => runHistory('redo', redo, state, dispatch);

export function recentHistoryPlugins() {
  // ProseMirror groups normal typing into actions and maps undo through document
  // changes. Its depth setting prunes in batches, so cap accessible actions too.
  return [new Plugin({
    key: recentKey,
    state: {
      init: () => ({ undo: 0, redo: 0 }),
      apply(transaction, value) {
        const action = transaction.getMeta(recentKey);
        if (action?.direction === 'undo') return { undo: value.undo - 1, redo: value.redo + 1 };
        if (action?.direction === 'redo') return { undo: value.undo + 1, redo: value.redo - 1 };
        return action?.counts || value;
      },
    },
    appendTransaction(transactions, previous, next) {
      if (transactions.some((transaction) => transaction.getMeta(recentKey))) return null;
      if (!transactions.some((transaction) => transaction.docChanged && transaction.getMeta('addToHistory') !== false)) return null;
      const current = recentActions(next);
      const startsAction = undoDepth(next) !== undoDepth(previous);
      return next.tr.setMeta(recentKey, { counts: {
        undo: Math.min(HISTORY_LIMIT, current.undo + (startsAction ? 1 : 0)), redo: 0,
      } }).setMeta('addToHistory', false);
    },
    props: {
      handleDOMEvents: {
        beforeinput(view, event) {
          if (event.inputType !== 'historyUndo' && event.inputType !== 'historyRedo') return false;
          event.preventDefault();
          (event.inputType === 'historyUndo' ? undoRecent : redoRecent)(view.state, view.dispatch);
          return true;
        },
      },
    },
  }), history({ depth: HISTORY_LIMIT, newGroupDelay: 500 })];
}

export const RecentHistory = Extension.create({
  name: 'recentHistory',
  addProseMirrorPlugins: recentHistoryPlugins,
  addCommands: () => ({
    undo: () => ({ state, dispatch }) => undoRecent(state, dispatch),
    redo: () => ({ state, dispatch }) => redoRecent(state, dispatch),
  }),
  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
      'Mod-я': () => this.editor.commands.undo(),
      'Mod-н': () => this.editor.commands.redo(),
    };
  },
});
