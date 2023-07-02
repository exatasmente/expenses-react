import { Helmet } from 'react-helmet-async';
import { filter, set } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar, TransactionForm } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'description', label: 'Descrição', alignRight: false },
  { id: 'amount', label: 'Valor', alignRight: false },
  { id: 'category', label: 'Categoria', alignRight: false },
  { id: 'date', label: 'Data', alignRight: false },
  { id: 'isExpense', label: 'Tipo', alignRight: false },
  { id: ''},
];

// ----------------------------------------------------------------------

const formatDate = (date) => {
  const formatter = new Intl.DateTimeFormat('pt-BR');

  return formatter.format(new Date(date).setDate(new Date(date).getDate() + 1));
}


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  let stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    const filters = ['description', 'category', 'isExpense', 'date', 'amount', 'creditCard', 'paidAt'];
    filters.forEach((filter) => {
      const queryValue = query.split(`${filter}:`);
      if (queryValue.length <= 1) {
          return;
      }
      
      const filterValue = queryValue[1].trim();
      
      
      if (!filterValue) {
        return;
      }

      if (filter === 'date' || filter === 'paidAt') {
        stabilizedThis = stabilizedThis.filter((el) =>{
          if (!el[0][filter]) return false;

          return formatDate(el[0][filter]).includes(filterValue)
        });
        
      } else if (filter === 'amount') {
        console.log(filterValue);
        stabilizedThis = stabilizedThis.filter((el) =>{
          console.log(el[0][filter].toString(), filterValue);
          return el[0][filter].toString().includes(filterValue)
        });
      }else {
        const filterType = filter === 'isExpense' ? 'boolean' : 'string';

        if (filterType === 'boolean') {
          const booleanValue = filterValue === 'true';
          stabilizedThis = stabilizedThis.filter((el) => {
            if (el[0][filter] === undefined) return  !booleanValue;
            return el[0][filter] === booleanValue
          });
        }

        if (filterType === 'string') {
          stabilizedThis = stabilizedThis.filter((el) => {
            if (el[0][filter] === undefined) return false;

            return el[0][filter].toLowerCase().includes(filterValue.toLowerCase())
          });
        }       
      
      }
    });

  }
  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [openModal, setOpenModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleOpenMenu = (event, id) => {
    setOpen(event.currentTarget);

    const transaction = USERLIST.find(id);
    setCurrentTransaction(transaction);
  };

  const handleCloseMenu = () => {
    setOpen(null);
    setCurrentTransaction({});
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const openUserFormModal = () => {
    setOpenModal(true);
  }

  const handleNewUser = () => {
    console.log('New User');
  };


  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  
  };

  const handleTransactionFormSubmit = (transaction) => {
    console.log(transaction);

    if (transaction.id === undefined) {
      USERLIST.save(transaction);
    } else {      
      USERLIST.update(transaction)
    }

    setOpenModal(false);
    setCurrentTransaction({});
    setOpen(null);
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  const formatCurrency = (value) => {
    value /= 100;
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return formatter.format(value);
  };

  
  const openConfirmDeleteDialog = () => {
      setConfirmDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    USERLIST.delete(currentTransaction.id);

    setConfirmDialogOpen(false);
    handleCloseMenu();
  }

  const handleCloseConfirmDeleteDialog = () => {
    setConfirmDialogOpen(false);
    handleCloseMenu();
  }

  const handleDuplicate = () => {
    currentTransaction.id = undefined;

    openUserFormModal();
  }

  const total = filteredUsers.reduce((acc, curr) => {
    if (curr.isExpense) {
      return acc - parseInt(curr.amount, 10);
    }
    return acc + parseInt(curr.amount, 10);
  }, 0);




  return (
    <>
      <Helmet>
        <title> {`Transações ${formatCurrency(total)}`} </title>
      </Helmet>
     
      <Container>
        

      <Dialog
        open={confirmDialogOpen}
        onClose={ () => setConfirmDialogOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle>Excluir Transação</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
              Tem certeza que deseja excluir essa transação ?    
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDelete} color='error'>Excluir</Button>
          <Button onClick={handleCloseConfirmDeleteDialog} autoFocus>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle>Transação</DialogTitle>
        <DialogContent>
          <TransactionForm  margin="dense" transaction={currentTransaction} onSubmit={handleTransactionFormSubmit}/>
          </DialogContent>
      </Dialog>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
          {`Transações ${formatCurrency(total)}`}
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openUserFormModal}>
            Nova Transação
          </Button>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, description, amount, category, date, isExpense, paidAt } = row;
                    const selectedUser = selected.indexOf(description) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell component="th" scope="row">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {description}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{formatCurrency(isExpense ? (amount * -1) : amount)}</TableCell>

                        <TableCell align="left">{category}</TableCell>

                        <TableCell align="left">{formatDate(date)} <small>{isExpense && paidAt ? formatDate(paidAt) : ''}</small></TableCell>
                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick= { (e) => handleOpenMenu(e, id)}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem  onClick={openUserFormModal} >
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }}/>
          Editar
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }} onClick={openConfirmDeleteDialog}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Excluir
        </MenuItem>

        <MenuItem onClick={handleDuplicate}>
          <Iconify icon={'eva:copy-fill'} sx={{ mr: 2 }} />
          Duplicar
        </MenuItem>


      </Popover>
    </>
  );
}