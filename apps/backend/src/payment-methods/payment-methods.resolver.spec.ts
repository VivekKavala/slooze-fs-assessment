import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodsResolver } from './payment-methods.resolver';

describe('PaymentMethodsResolver', () => {
  let resolver: PaymentMethodsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentMethodsResolver],
    }).compile();

    resolver = module.get<PaymentMethodsResolver>(PaymentMethodsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
