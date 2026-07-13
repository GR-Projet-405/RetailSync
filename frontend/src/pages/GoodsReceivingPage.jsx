import PageHeader from '../components/PageHeader';
import WorkspaceContainer from '../components/WorkspaceContainer';
import GoodsReceivingDashboard from '../features/goods-receiving/GoodsReceivingDashboard';


export default function GoodsReceivingPage() {
  return (
    <div>
      <WorkspaceContainer>
            <GoodsReceivingDashboard />
          </WorkspaceContainer>
    </div>
  );
}
