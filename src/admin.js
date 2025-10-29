import { mount } from 'svelte';
import Admin from './components/Admin.svelte';

const app = mount(Admin, {
  target: document.getElementById('app'),
});

export default app;
