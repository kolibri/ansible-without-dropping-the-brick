import React from 'react';
import { Slide, Text, Heading } from 'spectacle';
import { MDXProvider } from '@mdx-js/tag'
import components from './components';
import theme from './theme';
import CodeSlide from 'spectacle-code-slide';


// DEFAULT LAYOUT

export const DefaultSlide = ({ children, ...rest }) => (
  <Slide align="left" {...rest}>
    <MDXProvider components={components}>{children}</MDXProvider>
  </Slide>
);

// DARK LAYOUT

const darkComponents = {
  ...components,
  h2: ({ children }) => <Heading size={2} textColor={theme.screen.colors.quaternary}>{children}</Heading>,
  h3: ({ children }) => <Heading size={3} textColor={theme.screen.colors.quaternary}>{children}</Heading>,
  h4: ({ children }) => <Heading size={4} textColor={theme.screen.colors.quaternary}>{children}</Heading>,
  h5: ({ children }) => <Heading size={5} textColor={theme.screen.colors.quaternary}>{children}</Heading>,
  h6: ({ children }) => <Heading size={6} textColor={theme.screen.colors.quaternary}>{children}</Heading>,
  p: ({ children }) => <Text textColor="white">{children}</Text>
}

export const DarkSlide = ({ children, ...rest }) => (
  <Slide bgColor="black" {...rest}>
    <MDXProvider components={darkComponents}>{children}</MDXProvider>
  </Slide>
);

// CODE LAYOUT
/*
export const CodeSlide = ({ children, ...rest }) => (
  <Slide bgColor="#1d1f21" {...rest}>
    <MDXProvider components={components}>{children}</MDXProvider>
  </Slide>
);
*/


export const SlideWithCode = ({ children, ...rest }) => (
  <Slide bgColor="#1d1f21" {...rest}>
    <MDXProvider components={components}>{children}</MDXProvider>
  </Slide>
);


