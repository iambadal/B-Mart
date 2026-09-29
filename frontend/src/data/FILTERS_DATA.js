export const FILTERS_DATA = [
    {
        key: 'category',
        title: 'CATEGORIES',
        options: [{ name: 'Electronics', value: 'Electronics' }, { name: 'Fashion', value: 'Fashion' }, { name: 'Home & Kitchen', value: 'Home' }, { name: 'Grocery & Essentials', value: 'Grocery' }],
        type: 'checkbox'
    },
    {
        key: 'price',
        title: 'PRICE',
        options: [{ name: 'Rs. 199 and Below', value: { minPrice: 0, maxPrice: 199 } }, { name: 'Rs. 199 - Rs. 699', value: { minPrice: 199, maxPrice: 699 } }, { name: 'Rs. 1000 - Rs. 1999', value: { minPrice: 1000, maxPrice: 1999 } }, { name: 'Rs. 3000 and Above', value: { minPrice: 3000, maxPrice: 0 } }],
        type: 'checkbox'
    },
    {
        key: 'rating',
        title: 'CUSTOMER RATINGS',
        options: [{ name: '4 ★ & above', value: 4 }, { name: '3 ★ & above', value: 3 }],
        type: 'checkbox'
    },
    {
        key: 'newArrival',
        title: 'NEW ARRIVALS',
        options: [{ name: 'New Arrivals', value: true }],
        type: 'checkbox'
    },
    {
        key: 'inStock',
        title: 'AVAILABILITY',
        options: [{ name: 'Include Out of Stock', value: true }],
        type: 'checkbox'
    }
];
