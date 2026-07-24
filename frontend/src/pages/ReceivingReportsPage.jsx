import WorkspaceContainer from '../components/WorkspaceContainer';
import ReceivingReports from '../features/goods-receiving/ReceivingReports';

// 📈 Receiving Reports page - route: /goods-receiving/reports
export default function ReceivingReportsPage() {
  return (
    <WorkspaceContainer>
      <ReceivingReports />
    </WorkspaceContainer>
  );
}
