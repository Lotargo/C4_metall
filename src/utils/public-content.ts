import { getCollection } from 'astro:content';
export const overviewSections = async () => (await getCollection('overview')).sort((a, b) => a.data.order - b.data.order);
export const statusLabels = { supported: 'Доступно в текущей версии', evolving: 'Продолжает развиваться', review: 'Требует проверки человеком' };
