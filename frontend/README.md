# VET Frontend

## Development (without docker)

1. Create a .env variable with the following:
```sh
REACT_APP_GOOGLE_API_KEY=<your key>
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GEOCODE_URL=https://maps.googleapis.com/maps/api/geocode
REACT_APP_API_KEY=Zm9vYmFy
```
additional variables need to be prefixed with `REACT_APP_` to be usable in the app.
NOTE: The `REACT_APP_API_KEY` is only used in production and api key authentication is disabled for development. This variable is only needed when setting up the remote environment.

2. Install dependencies

```sh
npm install
```

3. Start the app
```sh
npm start
```

### React Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).