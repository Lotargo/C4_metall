export function installModelDialog(root:HTMLElement) {
  const dialog=root.querySelector<HTMLDialogElement>('[data-model-dialog]')!;
  const home=root.querySelector<HTMLElement>('[data-model-home]')!;
  const content=root.querySelector<HTMLElement>('[data-model-content]')!;
  const slot=dialog.querySelector<HTMLElement>('[data-model-dialog-slot]')!;
  const inspector=root.querySelector<HTMLElement>('.model-inspector')!;
  const dimensions=root.querySelector<HTMLElement>('#model-dimensions')!;
  const close=dialog.querySelector<HTMLButtonElement>('[data-model-dialog-close]')!;
  let trigger:HTMLElement|null=null,scroll=0;
  root.querySelectorAll<HTMLElement>('[data-model-expand]').forEach(button=>button.addEventListener('click',()=> {
    if(dialog.open)return;
    trigger=button;scroll=window.scrollY;
    home.style.height=content.getBoundingClientRect().height+'px';
    inspector.append(dimensions);slot.append(content);root.classList.add('model-expanded');
    dialog.showModal();document.body.classList.add('model-modal-open');
    close.focus({preventScroll:true});
    root.dispatchEvent(new Event('model-layout-changed'));
  }));
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=> {
    if(event.key!=='Tab')return;
    const focusable=[...dialog.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]')]
      .filter(element=>!element.hasAttribute('disabled')&&!element.closest('[hidden], [inert]')&&element.getClientRects().length>0);
    const first=focusable[0],last=focusable.at(-1);
    if(!first||!last)return;
    if(event.shiftKey&&document.activeElement===first) {event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last) {event.preventDefault();first.focus();}
  });
  dialog.addEventListener('close',()=> {
    content.append(dimensions);home.append(content);home.style.height='';root.classList.remove('model-expanded');
    document.body.classList.remove('model-modal-open');
    root.dispatchEvent(new Event('model-layout-changed'));
    window.scrollTo({top:scroll,behavior:'instant'});
    trigger?.focus({preventScroll:true});
  });
}
