import { ScryfallCard } from '@types';

// Espejo de ScryfallService.FRAME_EFFECT_TAGS / VARIANT_TAG_LABELS en el backend --
// mismo vocabulario curado, para que el nombre mostrado en el buscador de cartas ya
// anticipe el displayName que el backend va a calcular al crear el producto.
const FRAME_EFFECT_TAGS: Record<string, string> = {
  extendedart: 'EXTENDED_ART',
  showcase: 'SHOWCASE',
};

export const VARIANT_TAG_LABELS: Record<string, string> = {
  BORDERLESS: 'Borderless',
  EXTENDED_ART: 'Extended Art',
  SHOWCASE: 'Showcase',
  FULL_ART: 'Full Art',
};

export function extractVariantTags(card: ScryfallCard): string[] {
  const tags: string[] = [];

  if (card.border_color === 'borderless') {
    tags.push('BORDERLESS');
  }

  for (const effect of card.frame_effects ?? []) {
    const tag = FRAME_EFFECT_TAGS[effect.toLowerCase()];
    if (tag && !tags.includes(tag)) tags.push(tag);
  }

  if (card.full_art) {
    tags.push('FULL_ART');
  }

  return tags;
}

export function getCardDisplayName(card: ScryfallCard): string {
  const tags = extractVariantTags(card);
  if (tags.length === 0) return card.name;
  return card.name + tags.map(t => ` (${VARIANT_TAG_LABELS[t]})`).join('');
}
