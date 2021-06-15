# Tetris

This is my own implementation of a tetris game with the sole purpose to learn new things. Game logic is implemented in a [custom hook](https://www.npmjs.com/package/use-tetris)

This has started as a React app but eventually switched to Preact for smaller bundle size (check webpack config).

## Resources

- [A tetris using HTML5 Canvas.](https://github.com/CharlieGreenman/Html5Tetris)
- [Learn Modern javascript by implementing tetris game](https://medium.com/@michael.karen/learning-modern-javascript-with-tetris-92d532bcd057)

## Run the app

```sh
npm i && npm start
```

Then head on to [localhost:8080](localhost:8080)

## Deployment

```sh
git push
```

Netlify is setup to listen to changes on master. Whenever a change occurs in master, netlify will build the project (`npm run build`) and deploy the contents of the `dist` folder

## Credits

1. [how to use requestAnimationFrame with react hooks](https://css-tricks.com/using-requestanimationframe-with-react-hooks/)
2. [use event listener hook](https://usehooks.com/useEventListener/)

## Check more awesome hoooks

1. [hooks guide](https://hooks-guide.netlify.app/)
2. [use hooks](https://usehooks.com/)
3. [use hooks ts](https://usehooks-typescript.com/)
4. [awesome react hooks](https://github.com/rehooks/awesome-react-hooks)
