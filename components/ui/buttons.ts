// Button styles from the design: square corners, 44px minimum, no shadows.
const base =
  "inline-flex items-center justify-center rounded-sq font-medium no-underline cursor-pointer disabled:cursor-not-allowed";

/** Filled green: «حلِّل الإسناد», «افتح الموضع في المصدر». */
export const buttonPrimary = `${base} min-h-12 px-6 bg-green text-[16px] text-parchment hover:bg-green-deep hover:text-parchment`;

/** Green outline: «اعرض الشجرة», «انسخ التوثيق». */
export const buttonOutline = `${base} min-h-11 px-[18px] border-2 border-green bg-transparent text-[15px] text-green hover:bg-hover hover:text-green-deep`;

/** Gold outline on a green band: «اعرض الإسناد في الشجرة». */
export const buttonOnGreen = `${base} min-h-12 border-2 border-gold text-[16px] text-parchment hover:bg-green-deep hover:text-parchment`;
