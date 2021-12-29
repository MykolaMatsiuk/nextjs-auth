import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import AuthForm from '../components/auth/auth-form';

function AuthPage() {
	const { data: session, status } = useSession();
	const isLoading = status === 'loading';

	const router = useRouter();

	if (isLoading) return <p>Loading...</p>;

	if (session) {
		router.replace('/');
		return null;
	}

	return <AuthForm />;
}

export default AuthPage;
