import type { OperationalProjectConfig } from '../types'

export const OPERATIONAL_PROJECTS: OperationalProjectConfig[] = [
  {
    id: 'kuroort26',
    name: 'Курорт 26',
    counterId: 10849417,
    directClientLogin: 'kurort26-direct',
    purchasesMetric: 'ym:s:ecommercePurchases',
    addToCartMetric: 'ym:s:goal249520697reaches',
    cartGoalId: 249520697,
    orderGoalId: 3010849417,
    contactGoalId: 269264518,
    leadGoalIds: [30950899, 297174772, 362291918, 362292248, 344605174],
    uonApiKey: 'IT0ru9zn3VS7tSx044SJ',
  },
  {
    id: 'istok',
    name: 'Исток',
    counterId: 42474999,
    // TODO: уточнить clientLogin для Директа, если он отличается от kurort26-direct
    directClientLogin: '',
    purchasesMetric: 'ym:s:ecommercePurchases',
    addToCartMetric: 'ym:s:goal306476648reaches',
    cartGoalId: 306476648,
    orderGoalId: 306476647,
    contactGoalId: 244850303,
  },
  {
    id: 'belayarus',
    name: 'Белая Русь',
    counterId: 79711543,
    // TODO: уточнить clientLogin для Директа, если он отличается от kurort26-direct
    directClientLogin: '',
    purchasesMetric: 'ym:s:ecommercePurchases',
    addToCartMetric: 'ym:s:goal357869318reaches',
    cartGoalId: 357869318,
    orderGoalId: 566427741,
    contactGoalId: 244854837,
  },
]

export function getOperationalProjectById(id: string): OperationalProjectConfig | undefined {
  return OPERATIONAL_PROJECTS.find((project) => project.id === id)
}
