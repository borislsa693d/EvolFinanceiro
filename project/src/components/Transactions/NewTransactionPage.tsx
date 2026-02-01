import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Transaction } from '../../lib/api';
import TransactionForm from './TransactionForm';
import './NewTransactionPage.css';

const NewTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editTransaction = location.state?.editTransaction as Transaction | undefined;
  const isEditing = !!editTransaction;

  return (
    <div className="new-transaction-page-container">
      <h2 className="new-transaction-page-title">
        {isEditing ? 'Editar Transação' : 'Registrar Transação'}
      </h2>
      <TransactionForm
        editTransaction={editTransaction}
        onCancel={() => navigate(-1)}
        onSaved={() => navigate('/extrato')}
      />
    </div>
  );
};

export default NewTransactionPage;
