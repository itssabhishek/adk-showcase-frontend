import localFont from 'next/font/local';

export const helveticaNeue = localFont({
  src: [
    {
      path: '../../public/fonts/HelveticaNeueThin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueThinItalic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../../public/fonts/HelveticaNeueUltraLight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueLight.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueLightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/HelveticaNeueRoman.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueItalic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/HelveticaNeueMedium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueMediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/HelveticaNeueBold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueBoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/HelveticaNeueHeavy.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueHeavyItalic.otf',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../../public/fonts/HelveticaNeueBlack.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/HelveticaNeueBlackItalic.otf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-helvetica-neue',
  display: 'swap',
});
