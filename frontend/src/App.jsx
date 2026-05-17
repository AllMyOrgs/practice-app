import { useState } from 'react';
import SubmissionForm from './components/SubmissionForm.jsx';
import SubmissionList from './components/SubmissionList.jsx';
import './App.css';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Employee Registration</h1>
        <p>Fill in your details below to complete registration</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <SubmissionForm onSubmitSuccess={() => setRefreshKey(k => k + 1)} />
        </section>

        <section className="list-section">
          <SubmissionList refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
}
