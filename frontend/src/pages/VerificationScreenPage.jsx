import WorkspaceContainer from '../components/WorkspaceContainer';
import VerificationScreen from '../features/Goods-receiving/VerificationScreen';

// ✅ Verification Screen page - route: /goods-receiving/verify/:id
export default function VerificationScreenPage() {
  return (
    <WorkspaceContainer>
      <VerificationScreen />
    </WorkspaceContainer>
  );
}
