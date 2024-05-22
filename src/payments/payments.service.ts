import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(process.env.SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async getUser(email: string): Promise<Stripe.Customer> {
    try {
      const customers = await this.stripe.customers.search({
        query: `email:'${email}'`,
      });
      return customers.data[0];
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async getSubscriptions(): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.search({
        query: `status:'active'`,
      });
      return subscriptions.data;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  }

  async getIsUserActive(email: string): Promise<boolean> {
    try {
      const user = await this.getUser(email);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      const subscriptions = await this.getSubscriptions();
      const isUserActive = subscriptions.some(
        (sub) => sub.customer === user.id,
      );
      return isUserActive;
    } catch (error) {
      console.error('Erro ao buscar status da assinatura:', error);
      throw error;
    }
  }
}
