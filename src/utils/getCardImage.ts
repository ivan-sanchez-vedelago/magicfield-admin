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