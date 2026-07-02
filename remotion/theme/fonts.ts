/**
 * Typography — three text voices, never mixed within a role (style_analysis §3):
 *   1. Big titles    → Baloo 2 ExtraBold (Fredoka as secondary)
 *   2. Diagram labels → Patrick Hand (thin hand-printed casual)
 *   3. In-world text  → drawn into the illustration (not handled here)
 */
import {loadFont as loadBaloo} from '@remotion/google-fonts/Baloo2';
import {loadFont as loadFredoka} from '@remotion/google-fonts/Fredoka';
import {loadFont as loadPatrickHand} from '@remotion/google-fonts/PatrickHand';

const baloo = loadBaloo('normal', {weights: ['800']});
const fredoka = loadFredoka('normal', {weights: ['600']});
const patrickHand = loadPatrickHand('normal', {weights: ['400']});

/** Extra-bold rounded geometric sans for hero titles. */
export const TITLE_FONT = baloo.fontFamily;
/** Rounded sans, slightly lighter — secondary titles / large numbers. */
export const TITLE_FONT_ALT = fredoka.fontFamily;
/** Thin hand-printed caps for diagram labels. */
export const LABEL_FONT = patrickHand.fontFamily;
