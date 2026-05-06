var sum_to_n_a = function (n) {
  let sum = 0;
  if (n >= 0) {
    for (let i = 1; i <= n; i++) sum += i;
  } else {
    for (let i = -1; i >= n; i--) sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  // For negatives, the sum from -1 down to n is the negation of the sum
  // from 1 up to |n|. So we apply the formula to the magnitude and restore
  // the sign with Math.sign.
  const abs = Math.abs(n);
  return Math.sign(n) * (abs * (abs + 1)) / 2;
};

var sum_to_n_c = function (n) {
  if (n === 0) return 0;
  if (n > 0) return n + sum_to_n_c(n - 1);
  return n + sum_to_n_c(n + 1); // negative branch
};
 
module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };