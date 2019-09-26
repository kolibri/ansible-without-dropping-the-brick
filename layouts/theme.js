import Presenter from './Presenter.js'

export default {
  font: 'system-ui, sans-serif',
  monospace: 'Monaco, monospace',

  colors: {
    text: '#000',
    background: '#fff',
    link: '#07c',
    pre: '#666',
    preBackground: '#333',
    code: '#666',
  },
  css: {
    fontSize: '16px',
    textAlign: 'center',
    '@media screen and (min-width:56em)': {
      fontSize: '32px',
    },
    '@media screen and (min-width:64em)': {
      fontSize: '48px',
    },
    '@media print': {
      fontSize: '40px',
    },
    'li > p': {
      margin: 0,
    },
  },
  pre: {
    textAlign: 'left',
  },
  ol: {
    textAlign: 'left',
  },
  ul: {
    textAlign: 'left',
  },
  Presenter: Presenter
}
