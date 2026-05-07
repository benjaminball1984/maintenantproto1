import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SignPage from '@/pages/SignPage';
import ThanksPage from '@/pages/ThanksPage';
import OrderPage from '@/pages/OrderPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import LegalPage from '@/pages/LegalPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signer" element={<SignPage />} />
        <Route path="/merci" element={<ThanksPage />} />
        <Route path="/commander" element={<OrderPage />} />
        <Route path="/commander/confirmation" element={<OrderConfirmationPage />} />
        <Route path="/mentions-legales" element={<LegalPage />} />
        <Route path="/politique-confidentialite" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
