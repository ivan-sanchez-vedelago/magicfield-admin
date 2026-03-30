import { ScryfallCard } from '@types';

export const getCardImage = (
  card: ScryfallCard,
  size: 'small' | 'normal' | 'large' | 'png' = 'png'
): string | undefined => {
  if (size === 'png' && card.image_uris?.png) {
    return card.image_uris.png;
  }

  if (card.image_uris?.[size]) {
    return card.image_uris[size];
  }

  if (card.card_faces?.[0]?.image_uris?.[size]) {
    return card.card_faces[0].image_uris[size];
  }

  return undefined;
};

export const getAllCardImages = (
  card: ScryfallCard,
  size: 'small' | 'normal' | 'large' | 'png' = 'png'
): string[] => {
  // Carta normal (una cara)
  if (card.image_uris) {
    const url = size === 'png' ? card.image_uris.png : card.image_uris[size];
    return url ? [url] : [];
  }

  // Carta de doble cara
  if (card.card_faces) {
    return card.card_faces
      .map(face => face.image_uris?.[size])
      .filter((url): url is string => !!url);
  }

  return [];
};