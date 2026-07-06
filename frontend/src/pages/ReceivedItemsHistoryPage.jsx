import WorkspaceContainer from '../components/WorkspaceContainer';
import ReceivedItemsHistory from '../features/goods-receiving/ReceivedItemsHistory';

// 📜 Received Items History page - route: /goods-receiving/history
export default function ReceivedItemsHistoryPage() {
  return (
    <WorkspaceContainer>
      <ReceivedItemsHistory />
    </WorkspaceContainer>
  );
}
