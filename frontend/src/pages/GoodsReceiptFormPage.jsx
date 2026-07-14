import WorkspaceContainer from '../components/WorkspaceContainer';
import GoodsReceiptForm from '../features/goods-receiving/GoodsReceiptForm';

// 📝 New Receipt page - route: /goods-receiving/new
export default function GoodsReceiptFormPage() {
  return (
    <WorkspaceContainer>
      <GoodsReceiptForm />
    </WorkspaceContainer>
  );
}
