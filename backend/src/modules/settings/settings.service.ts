import { prisma } from '../../config/db';

export class SettingsService {
  /**
   * Fetch company settings (auto-creates single row if missing)
   */
  public async getSettings(): Promise<any> {
    let settings = await prisma.companySettings.findFirst();

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'NextGen Enterprise Solutions Ltd.',
          invoicePrefix: 'INV-',
          challanPrefix: 'CH-',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          language: 'en',
          theme: 'light'
        }
      });
    }

    return settings;
  }

  /**
   * Update company settings
   */
  public async updateSettings(data: any): Promise<any> {
    const current = await this.getSettings();

    return prisma.companySettings.update({
      where: { id: current.id },
      data: {
        companyName: data.companyName,
        companyLogo: data.companyLogo,
        gstNumber: data.gstNumber,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        invoicePrefix: data.invoicePrefix,
        challanPrefix: data.challanPrefix,
        currency: data.currency,
        timezone: data.timezone,
        language: data.language,
        theme: data.theme
      }
    });
  }
}
