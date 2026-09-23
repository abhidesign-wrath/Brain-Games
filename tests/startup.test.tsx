import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../src/app/index';

test('launch screen mounts and initializes the real engine', async () => {
  await render(<HomeScreen />);
  expect(screen.getByRole('header', { name: 'Mindtrail' })).toBeTruthy();
  expect(screen.getByTestId('foundation-status')).toHaveTextContent(/Engine ready/);
});
