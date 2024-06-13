import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import createAppStore from "./redux/store";
import axios from "axios";
import CommonLoading from "./components/loader/CommonLoading";
import App from "./App";
import { getTitleFromRoute } from "./utils/docTitle";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const ErrorComponent = ({ errorMessage }) => (
  <div className="text-red-500 font-bold text-center">{errorMessage}</div>
);

const AppContainer = () => {
  const location = useLocation();
  const [storeLoading, setStoreLoading] = useState(true);
  const [status, setStatus] = useState(true);
  const [error, setError] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await axios.get("/server-status");
      } catch (err) {
        setError("Server is down. Please try again later.");
      } finally {
        setStatus(false);
      }
    };

    checkServerStatus();
  }, []);

  // Asynchronously initialize the Redux store, including data fetching and authentication,
  // while displaying a loading indicator. Making sure that the store is initialized with credentials and data before rendering the app.

  useEffect(() => {
    const initializeStore = async () => {
      try {
        const appStore = await createAppStore();
        setStore(appStore);
      } catch (err) {
        setError(`Error initializing the app: ${err.message}`);
      } finally {
        setStoreLoading(false);
      }
    };

    initializeStore();
  }, []);

  if ((storeLoading && status && !error) || error) {
    return (
      <div className="flex h-screen items-center justify-center">
        {storeLoading && status && !error ? (
          <CommonLoading />
        ) : (
          <ErrorComponent errorMessage={error} />
        )}
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Helmet>
        <title>{getTitleFromRoute(location.pathname)}</title>
      </Helmet>
      <App />
    </Provider>
  );
};

export default AppContainer;
