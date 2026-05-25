# Bonne pratique : Utiliser une image de base officielle et légère (Alpine)
# On spécifie une version précise (ici 1.25) pour éviter que des mises à jour futures cassent notre image
FROM nginx:1.25-alpine

# Bonne pratique : Ajouter des métadonnées (optionnel mais recommandé)
LABEL maintainer="patricecotcho@gmail.com"
LABEL description="Portfolio personnel"

# On supprime la page d'accueil par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# On copie les fichiers de ton portfolio depuis ton ordinateur vers le dossier que Nginx utilise pour afficher les sites web
# Le "." signifie "tout ce qui est dans le dossier actuel" (en respectant le .dockerignore)
COPY . /usr/share/nginx/html

# On expose le port 80 (le port standard pour le trafic web non sécurisé)
EXPOSE 80

# On lance Nginx en premier plan pour que le conteneur ne s'arrête pas
CMD ["nginx", "-g", "daemon off;"]