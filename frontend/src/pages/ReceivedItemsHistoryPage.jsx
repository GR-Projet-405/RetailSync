import WorkspaceContainer from '../components/WorkspaceContainer';
import ReceivedItemsHistory from '../features/Goods-receiving/ReceivedItemsHistory';

// 📜 Received Items History page - route: /goods-receiving/history
export default function ReceivedItemsHistoryPage() {
  return (
    <WorkspaceContainer>
      <ReceivedItemsHistory />
    </WorkspaceContainer>
  );
}
