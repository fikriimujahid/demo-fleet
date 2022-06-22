FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

# # Create group and user
# RUN groupadd -r user_app && useradd -g user_app user_app

# # Set ownership and permissions
# RUN chown -R user_app:user_app /app

# #switch user
# USER user_app

EXPOSE 8000

CMD ["npm", "run", "watch"]