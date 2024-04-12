'use client';
import Alert from '@/components/Alert';
import InputErrorMessage from '@/components/InputErrorMessage';
import { formatError } from '@/lib/utils';
import { UpdatePasswordSchema } from '@/lib/validationSchema';
import {
  createClientComponentClient,
  type User,
} from '@supabase/auth-helpers-nextjs';
import { useState, type FormEvent } from 'react';
import { ZodError, type z } from 'zod';

type FormData = z.infer<typeof UpdatePasswordSchema>;

export default function PasswordForm({ user }: { user: User | undefined }) {
  const supabase = createClientComponentClient();
  const [errors, setErrors] = useState<FormData>();
  const [message, setMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    password: '',
    passwordConfirm: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormSuccess(false);
    setErrors(undefined);
    setMessage('');

    const password = formData.password;
    const passwordConfirm = formData.passwordConfirm;

    try {
      UpdatePasswordSchema.parse({ password, passwordConfirm });
    } catch (err) {
      if (err instanceof ZodError) {
        const errs = formatError(err) as FormData;
        setErrors(errs);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      return;
    }

    // reset form
    setFormData({ password: '', passwordConfirm: '' });
    setFormSuccess(true);
    setMessage('Your password was updated successfully.');
  };
  return (
    <div className="w-11/12 rounded-lg p-12 px-6 py-10 sm:w-8/12 sm:px-10 sm:py-6 md:w-6/12 lg:w-5/12 2xl:w-3/12">
      {message ? (
        <Alert
          className={`${formSuccess ? 'alert-info' : 'alert-error'} mb-10`}
        >
          {message}
        </Alert>
      ) : null}
      <h2 className="mb-4 text-4xl font-semibold">Update Password</h2>
      <p className="mb-4 font-medium">
        Hi {user?.email}, Enter your new password below and confirm it
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData?.password ?? ''}
            onChange={(ev) =>
              setFormData({ ...formData, password: ev.target.value })
            }
            className="input input-bordered"
          />
        </div>
        {errors?.password ? (
          <InputErrorMessage>{errors?.password}</InputErrorMessage>
        ) : null}
        <div className="form-control">
          <label htmlFor="passwordConfirm" className="label">
            Confirm Password
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm ?? ''}
            onChange={(ev) =>
              setFormData({ ...formData, passwordConfirm: ev.target.value })
            }
            className="input input-bordered"
          />
        </div>
        {errors?.passwordConfirm ? (
          <InputErrorMessage>{errors?.passwordConfirm}</InputErrorMessage>
        ) : null}
        <div className="form-control mt-6">
          <button className="btn btn-primary no-animation">
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
