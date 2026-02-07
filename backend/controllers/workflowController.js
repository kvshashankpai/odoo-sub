// Add this new function:
exports.getSubscriptionById = async (req, res) => {
  try {
    const sub = await Subscription.findByPk(req.params.id);
    if (!sub) return res.status(404).json({ msg: "Not found" });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};