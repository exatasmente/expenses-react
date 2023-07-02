import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import Input from '@mui/material/Input';

import Grid from '@mui/material/Grid';
import USERLIST from '../../../_mock/user';
import { formatCurrency } from '../../../utils/formatCurrency';

  const formatDate = (value) => {

    if (!value) return '';
    const date = new Date(value);
    return date.toISOString().split('T')[0]; 
  };


export default function TransactionForm(props) {

    
  const {transaction, onSubmit} = props;


  const [description, setDescription] = useState(transaction?.description);
  const [amount, setAmount] = useState(transaction?.amount ? formatCurrency(transaction?.amount, false) : '');
  const [isExpense, setIsExpense] = useState(transaction?.isExpense || true);
  const [isCreditExpense, setIsCreditExpense] = useState(transaction?.isCreditExpense || false);
  const [category, setCategory] = useState(transaction?.category);
  const [creditCard, setCreditCard] = useState(transaction?.creditCard || '');
  const [date, setDate] = useState(transaction?.date ? formatDate(transaction?.date) : formatDate(new Date('2023-07-10')));
  const [paidAt, setPaidAt] = useState(transaction?.paidAt ? formatDate(transaction?.paidAt) : '');
  

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui você pode salvar os dados da transação no banco de dados ou realizar outras ações necessárias.

    transaction.description = description;
    transaction.amount = amount.replace(/[^\d]/g, '') ;
    transaction.isExpense = isExpense;
    transaction.category = category;
    transaction.date = date;
    transaction.isCreditExpense = isCreditExpense;
    transaction.creditCard = creditCard;
    transaction.paidAt = paidAt;

    

    onSubmit(transaction);
  };



  const handleAmountChange = (e) => {
    const inputValue = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(inputValue / 100);
    setAmount(formattedValue.replace('R$', '').trim());
  };

  return (
    <form onSubmit={handleSubmit}>
        <Grid container spacing={2} padding={2}>
            <Grid item xs={6}>
                <TextField
                    label="Descrição"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    fullWidth
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    label="Data da Transação"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(formatDate(new Date(e.target.value)))}
                    fullWidth
                    required
                />
            </Grid>
           
            <Grid item xs={6}>
            <FormControl fullWidth>
                <TextField
                label="Valor"
                value={amount}
                onChange={handleAmountChange}
                required
                InputProps={{
                    inputComponent: Input,
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                fullWidth
                />
            </FormControl>
            </Grid>
            <Grid item xs={6}>
                <TextField
                    label="Categoria"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={6}>
            <FormControlLabel
                control={
                <Switch
                    checked={isExpense}
                    onChange={() => setIsExpense(!isExpense)}
                    color="warning"
                />
                }
                label="Despesa"
            />
            </Grid>
            {isExpense ? ( 
                <Grid item xs={6}>
                <FormControlLabel
                    control={
                    <Switch
                        checked={isCreditExpense}
                        onChange={() => setIsCreditExpense(!isCreditExpense)}
                        color="warning"
                    />
                    }
                    label="Cartão de Crédito"
                />
                </Grid>   
                
            ) : (
                <div/>
            )}
             {isCreditExpense ? (
            <Grid item xs={6}>
                 <TextField
                    label="Cartão Utilizado"
                    value={creditCard}
                    onChange={(e) => setCreditCard(e.target.value)}
                    fullWidth
                />
            </Grid>) : ( 
                <div/>
            ) }
            {isCreditExpense ? (
            <Grid item xs={6}>
                <TextField
                    label="Data de Pagamento"
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(formatDate(new Date(e.target.value)))}
                    fullWidth
                />
            </Grid>) : ( 
                <div/>
            ) }
            
            <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit">
                    Salvar Transação
                </Button>
            </Grid>
        </Grid>
    </form>
  );
}