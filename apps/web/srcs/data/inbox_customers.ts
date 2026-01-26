export type Customer = {
  id: string;
  displayName: string;
  kana: string;
};

const placeholderCustomers: Customer[] = Array.from({ length: 3 }, (_, index) => ({
  id: `placeholder-${index + 1}`,
  displayName: '',
  kana: '',
}));

export const customers: Customer[] = [
  {
    id: 'otani-yuhi',
    displayName: '大谷 優光',
    kana: 'おおたに ゆうひ',
  },
  ...placeholderCustomers,
];
