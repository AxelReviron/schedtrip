<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Latitude implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_numeric($value)) {
            $fail('The :attribute attribute must be a number.');
            return;
        }

        if ($value < -90 || $value > 90) {
            $fail('The :attribute attribute must be between -90 and 90.');
        }
    }
}
