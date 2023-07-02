import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import Input from '@mui/material/Input';

import Grid from '@mui/material/Grid';

function TransactionForm() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isExpense, setIsExpense] = useState(false);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Aqui você pode salvar os dados da transação no banco de dados ou realizar outras ações necessárias.

    setDescription('');
    setAmount('');
    setIsExpense(false);
    setCategory('');
    setDate('');
  };

  const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return formatter.format(value);
  };

  const handleAmountChange = (e) => {
    const inputValue = e.target.value.replace(/[^\d]/g, '');
    const formattedValue = formatCurrency(inputValue / 100);

    console.log(formattedValue);
    setAmount(formattedValue.replace('R$', '').trim());
  };

  return (
    <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
                    label="Data"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
            <Grid item xs={12}>
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
            <Grid item xs={12}>
                <Button variant="contained" color="primary" type="submit">
                    Adicionar Transação
                </Button>
            </Grid>
        </Grid>
    </form>
  );
}

export default TransactionForm;
