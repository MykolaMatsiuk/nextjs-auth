import { getSession } from 'next-auth/react';

import { connectToDatabase } from '../../../lib/db';
import { hashPassword, verifyPassword } from '../../../lib/auth';

async function handler(req, res) {
	if (req.method !== 'PATCH') return;

	const session = await getSession({ req });

	if (!session) {
		return res.status(401).json({ message: 'Not authenticated!' });
	}

	const { email } = session.user;
	const { oldPassword, newPassword } = req.body;

	const client = await connectToDatabase();

	const usersCollection = client.db().collection('users');

	const user = await usersCollection.findOne({ email });

	if (!user) {
		client.close();
		return res.status(404).json({ message: 'User not found!' });
	}

	const currentPassword = user.password;

	const arePasswordsEqual = await verifyPassword(
		oldPassword,
		currentPassword
	);

	if (!arePasswordsEqual) {
		client.close();
		return res.status(422).json({ message: 'Invalid password!' });
	}
	const hashedPassword = await hashPassword(newPassword);

	await usersCollection.updateOne(
		{ email },
		{ $set: { password: hashedPassword } }
	);

	res.status(200).json({ message: 'Password updated!' });

	client.close();
}

export default handler;
