#!/usr/bin/env bash
# Floradex — script de déploiement (Session 5)
# Lance ceci depuis le dossier github-deploy/ pour pousser sur main.
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ Vérification du repo git…"
if [ ! -d .git ]; then
  echo "❌ Pas de .git ici. Si c'est ton premier deploy, fais :"
  echo "   git init && git remote add origin git@github.com:docteuriannotta/florescence-poc.git"
  exit 1
fi

git status --short

echo ""
echo "▶ Stage de tous les fichiers…"
git add -A

echo ""
DEFAULT_MSG="Session 5 — Fiches Wikipedia enrichies (photo + description, anim déblocage, filtre famille)"
read -p "Message de commit [$DEFAULT_MSG] : " MSG
MSG="${MSG:-$DEFAULT_MSG}"

echo ""
echo "▶ Commit + push…"
git commit -m "$MSG" || echo "(rien à commiter)"
git push origin main

echo ""
echo "✅ Push terminé."
echo "   URL prod : https://docteuriannotta.github.io/florescence-poc/"
echo "   Compte ~1 minute pour que GitHub Pages reflète le commit."
echo ""
echo "▶ Vérif post-deploy : recharge l'app sur ton téléphone."
echo "   Le SW va invalider l'ancien cache 'floradex-v2-…-d' tout seul."
