import { ScryfallCard } from '@types';

export const getCardImage = (
  card: ScryfallCard,
  size: 'small' | 'normal' | 'large' = 'small'
): string | undefined => {

  if (card.image_uris?.[size]) {
    return card.image_uris[size];
  }

  if (card.card_faces?.[0]?.image_uris?.[size]) {
    return card.card_faces[0].image_uris[size];
  }

  return undefined;

};