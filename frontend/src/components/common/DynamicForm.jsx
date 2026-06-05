import { useState, useEffect } from 'react';

const DynamicForm = ({
  fields = [],
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel'
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Populate form data with initial values or defaults
    const defaults = {};
    fields.forEach(field => {
      defaults[field.name] = initialValues[field.name] !== undefined 
        ? initialValues[field.name] 
        : (field.type === 'checkbox' ? false : '');

      // Special handling for dates to format YYYY-MM-DD
      if (field.type === 'date' && initialValues[field.name]) {
        try {
          const dateVal = new Date(initialValues[field.name]);
          defaults[field.name] = dateVal.toISOString().split('T')[0];
        } catch (e) {
          defaults[field.name] = '';
        }
      }
      
      // Special handling for object relations (like assignedClass._id or just class)
      if (typeof defaults[field.name] === 'object' && defaults[field.name] !== null) {
        defaults[field.name] = defaults[field.name]._id || defaults[field.name].id || '';
      }
    });
    setFormData(defaults);
    setErrors({});
  }, [fields, initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // Clear error for field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name] : '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const val = formData[field.name];

      // Required check
      if (field.required && (val === '' || val === null || val === undefined)) {
        tempErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }

      // Pattern match regex checks
      if (val && field.pattern && !field.pattern.test(val)) {
        tempErrors[field.name] = field.errorMessage || `${field.label} format is invalid`;
        isValid = false;
      }

      // Numeric boundary checks
      if (val !== '' && field.type === 'number') {
        const num = Number(val);
        if (field.min !== undefined && num < field.min) {
          tempErrors[field.name] = `${field.label} must be at least ${field.min}`;
          isValid = false;
        }
        if (field.max !== undefined && num > field.max) {
          tempErrors[field.name] = `${field.label} cannot exceed ${field.max}`;
          isValid = false;
        }
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => {
          const inputId = `field-${field.name}`;
          return (
            <div 
              key={field.name}
              className={`flex flex-col ${field.fullWidth ? 'md:col-span-2' : ''}`}
            >
              <label htmlFor={inputId} className="form-label font-medium">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>

              {/* Renders dropdown selects */}
              {field.type === 'select' ? (
                <select
                  id={inputId}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className={`form-input focus:border-indigo-500 focus:ring-indigo-500/20 ${errors[field.name] ? 'border-rose-500 dark:border-rose-500' : ''}`}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                /* Renders checkbox flags */
                <div className="flex items-center gap-2 py-3">
                  <input
                    id={inputId}
                    type="checkbox"
                    name={field.name}
                    checked={!!formData[field.name]}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">{field.description}</span>
                </div>
              ) : field.type === 'textarea' ? (
                /* Renders multiline comments */
                <textarea
                  id={inputId}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className={`form-input resize-none focus:border-indigo-500 focus:ring-indigo-500/20 ${errors[field.name] ? 'border-rose-500 dark:border-rose-500' : ''}`}
                />
              ) : (
                /* Standard inputs (text, number, date, tel, email) */
                <input
                  id={inputId}
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  className={`form-input focus:border-indigo-500 focus:ring-indigo-500/20 ${errors[field.name] ? 'border-rose-500 dark:border-rose-500' : ''}`}
                />
              )}

              {/* Validation errors indication */}
              {errors[field.name] && (
                <span className="text-xs text-rose-500 mt-1 font-medium">{errors[field.name]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Button panels */}
      <div className="flex justify-end gap-3 border-t pt-4 mt-2 border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-semibold text-sm dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition-all font-semibold text-sm dark:shadow-none"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
