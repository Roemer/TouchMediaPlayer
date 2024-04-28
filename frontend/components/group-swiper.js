const template = `
<div class="swiper group-swiper">
    <div class="swiper-wrapper">
        <slot></slot>
    </div>
</div>
`;

export default {
    mounted: function () {
        this.swiper = new Swiper('.group-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 10,
            centeredSlides: false,
            direction: 'horizontal',
        });
    },
    template: template,
    methods: {
        selectCard: function (cardIndex) {
            this.swiper.slideTo(cardIndex);
        }
    }
}
