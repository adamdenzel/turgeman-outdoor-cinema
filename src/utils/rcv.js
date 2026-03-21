/**
 * Ranked Choice Voting algorithm.
 * @param {string[][]} ballots - Array of ballots, each ballot is an ordered array of suggestion IDs.
 * @param {string[]}   candidates - Array of all candidate IDs.
 * @returns {string[]} All candidates sorted by final ranking (winner first).
 */
export function rankedChoiceVote(ballots, candidates) {
  if (!ballots.length || !candidates.length) return candidates

  const eliminated = []
  let remaining = [...candidates]

  while (remaining.length > 1) {
    // Count first-choice votes among remaining candidates
    const counts = Object.fromEntries(remaining.map(c => [c, 0]))
    for (const ballot of ballots) {
      const top = ballot.find(id => remaining.includes(id))
      if (top) counts[top]++
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    // Check for majority winner
    const winner = remaining.find(c => counts[c] > total / 2)
    if (winner) {
      // Sort remaining by votes descending, then append eliminated in reverse
      return [
        ...remaining.sort((a, b) => counts[b] - counts[a]),
        ...eliminated.reverse(),
      ]
    }

    // Eliminate candidate(s) with fewest votes
    const minVotes = Math.min(...remaining.map(c => counts[c]))
    const losers   = remaining.filter(c => counts[c] === minVotes)
    eliminated.push(...losers)
    remaining = remaining.filter(c => !losers.includes(c))

    if (!remaining.length) {
      return [...losers, ...eliminated.slice(0, -losers.length).reverse()]
    }
  }

  return [...remaining, ...eliminated.reverse()]
}
