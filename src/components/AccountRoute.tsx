import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import { AppState } from '../stores';
import { AccountState } from '../stores/account/types';
interface PropsChild {
  children?: any
  // any props that come into the component
}

export const AccountRoute = ({ children }: PropsChild) => {
  
  //Lấy thông tin account state từ Store vào để dùng.
  const account: AccountState = useSelector((state: AppState) => state.account);

  return account.token ? <Navigate to='/admin/home' /> : <Navigate to='/login' />;
};
