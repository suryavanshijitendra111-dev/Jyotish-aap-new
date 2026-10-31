import { TranslationDictionary } from '../types';
import { en } from './en';

export const ru: TranslationDictionary = {
  ...en,
  common: {
    ...en.common,
    appName: 'JeevanDarpan',
    appTagline: 'Ведическое самопознание и космический спутник',
    privateEdition: 'Частное семейное издание',
    start: 'Начать',
    goBack: 'Назад',
    cancel: 'Отмена',
    save: 'Сохранить',
    close: 'Закрыть',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Произошла непредвиденная ошибка.',
    retry: 'Повторить',
    verified: 'Детерминированно проверено',
    notAvailable: 'Недоступно',
    success: 'Успешно выполнено',
    confirm: 'Подтвердить',
    delete: 'Удалить',
    active: 'Активный',
    language: 'Язык',
    settings: 'Настройки',
    yes: 'Да',
    no: 'Нет',
    name: 'Имя',
    next: 'Далее',
    previous: 'Назад',
    downloadPdf: 'Скачать PDF',
    share: 'Поделиться',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    why: 'Почему?',
    select: 'Выбрать'
  }
};
