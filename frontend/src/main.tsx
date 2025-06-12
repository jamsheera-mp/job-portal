import { type FC } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { store } from './store';
import HomePage from './features/home/components/HomePage';
import App from './App';
import './styles/index.css';

const Root: FC = () => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);