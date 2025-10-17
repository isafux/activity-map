/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp } from 'vue';
import './output.css';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'tailwindcss-primeui';
import 'primeicons/primeicons.css';
import { Form } from '@primevue/forms';
import {
  InputText,
  Button,
  Checkbox,
  CheckboxGroup,
  Message,
  Select,
} from 'primevue';

const app = createApp(App);
// app.use(PrimeVue, { unstyled: true });
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
});

app.component('Form', Form);
app.component('InputText', InputText);
app.component('Button', Button);
app.component('Checkbox', Checkbox);
app.component('CheckboxGroup', CheckboxGroup);
app.component('Message', Message);
app.component('Select', Select);

app.mount('#app');
