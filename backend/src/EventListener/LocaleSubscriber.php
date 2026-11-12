<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Résout la locale de la requête à partir de l'en-tête HTTP Accept-Language
 * (§i18n : français/anglais/arabe). getPreferredLanguage() gère déjà la
 * négociation par q-value contre une liste de locales supportées, pas besoin
 * de parser l'en-tête à la main.
 */
class LocaleSubscriber implements EventSubscriberInterface
{
    private const SUPPORTED_LOCALES = ['fr', 'en', 'ar'];

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $locale = $request->getPreferredLanguage(self::SUPPORTED_LOCALES);

        $request->setLocale($locale ?? 'fr');
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 20],
        ];
    }
}
