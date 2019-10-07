# Ansible without dropping the brick

A beginner talk about [Ansible](http://ansible.com)

[Open slides](https://kolibri.github.io/ansible-without-dropping-the-brick/)

## Commands 

```bash
# check the ignored slide files
vi|nano|subl concat.js

# build deck.mdx from partial slide files
$ yarn deck
$ yarn deck:watch # for lazy people like me

# start the slides
$ yarn start

# create fixed html version (still needs a webserver for serving)
$ yarn build
```

## Shortcuts while presenting

- `ALT + P`: Presenter mode

- `ALT + G`: Grid mode

## Quick overview for this repo

Uses (the totally awesome) [mdx-deck](https://github.com/jxnblk/mdx-deck) and (the fully sublime) [code-surfer](https://github.com/pomber/code-surfer).


- `deck/**/*.mdx`: All the slides in a (almost) "one file per slide" approach. Made for mor simple organization and quick slide finding.

- `./deck.mdx`: The aggregated MDX file for slide-deck. Created with `yarn deck`.

- `concat.js`: puts all the single files together. To ignore files, add path to the `ignore`-array.

- `layouts/`: Custom layouts, theme etc. for mdx-deck.

- `demo/*` Demo/Tryout/Example area for some of the slides. (Mainly for myself, not for visitors, please do no expect anything working here yet)

