/* eslint-disable react-refresh/only-export-components */
import { type FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import AppRoutes from './core/routes/routes';
import './styles/index.css';

const Root: FC = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);