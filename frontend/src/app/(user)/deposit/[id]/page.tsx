type Props = { params: Promise<{ id: string }> };

export default async function DepositInvoicePage({ params }: Props) {
  const { id } = await params;
  return <div className="mx-auto max-w-md p-4">Invoice Deposit {id}</div>;
}
