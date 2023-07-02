export function formatCurrency(value, inCents = true) {

    value =  inCents ? value : value / 100;

    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return formatter.format(value);
};
